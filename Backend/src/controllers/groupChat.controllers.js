



import { GroupChat } from "../models/GroupChat.model.js";
import { User } from "../models/user.model.js";

// ── Create Group ──────────────────────────────────────────────────────────────
export const createGroup = async (req, res) => {
  try {
    const { name, memberIds } = req.body;
    const currentUser = req.user;

    if (!name?.trim()) return res.status(400).json({ message: "Group name is required" });
    if (!memberIds?.length) return res.status(400).json({ message: "Select at least one member" });

    const allMembers = [...new Set([currentUser._id.toString(), ...memberIds])];

    const group = await GroupChat.create({
      name: name.trim(),
      createdBy: currentUser._id,
      members: allMembers,
      admins: [currentUser._id],
    });

    const populated = await GroupChat.findById(group._id)
      .populate("members", "name username picture")
      .populate("createdBy", "name username picture")
      .populate("admins", "name username");

    return res.status(201).json({ message: "Group created", data: populated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// ── Get my groups ─────────────────────────────────────────────────────────────
export const getMyGroups = async (req, res) => {
  try {
    const currentUser = req.user;
    const groups = await GroupChat.find({ members: currentUser._id })
      .populate("members", "name username picture")
      .populate("admins", "name username")
      .populate("createdBy", "name username")
      .populate("lastMessage.sender", "name username")
      .sort({ updatedAt: -1 });
    return res.status(200).json({ data: groups });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ── Get group messages ────────────────────────────────────────────────────────
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const currentUser = req.user;

    const group = await GroupChat.findById(groupId)
      .populate("members", "name username picture")
      .populate("admins", "name username")
      .populate("messages.sender", "name username picture")
      .populate("createdBy", "name username");

    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember = group.members.some(m => m._id.toString() === currentUser._id.toString());
    if (!isMember) return res.status(403).json({ message: "Not a member of this group" });

    return res.status(200).json({ data: group });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ── Send message ──────────────────────────────────────────────────────────────
export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text } = req.body;
    const currentUser = req.user;

    if (!text?.trim()) return res.status(400).json({ message: "Message is empty" });

    const group = await GroupChat.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isMember = group.members.some(m => m.toString() === currentUser._id.toString());
    if (!isMember) return res.status(403).json({ message: "Not a member" });

    group.messages.push({ sender: currentUser._id, text: text.trim(), readBy: [currentUser._id] });
    group.lastMessage = { text: text.trim(), sender: currentUser._id, at: new Date() };
    await group.save();

    const lastMsg = group.messages[group.messages.length - 1];

    return res.status(200).json({
      data: {
        _id: lastMsg._id,
        sender: {
          _id: currentUser._id, name: currentUser.name,
          username: currentUser.username, picture: currentUser.picture,
        },
        text: text.trim(),
        createdAt: lastMsg.createdAt,
      }
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ── Add members ───────────────────────────────────────────────────────────────
export const addMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body;
    const currentUser = req.user;

    const group = await GroupChat.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isAdmin = group.admins.some(a => a.toString() === currentUser._id.toString());
    if (!isAdmin) return res.status(403).json({ message: "Only admins can add members" });

    const newMembers = memberIds.filter(id => !group.members.map(m => m.toString()).includes(id));
    group.members.push(...newMembers);
    await group.save();

    const updated = await GroupChat.findById(groupId)
      .populate("members", "name username picture")
      .populate("admins", "name username");
    return res.status(200).json({ message: "Members added", data: updated });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ── Remove member OR leave group ──────────────────────────────────────────────
// DELETE /group/:groupId/remove/:memberId
export const removeMember = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const currentUser = req.user;

    const group = await GroupChat.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const currentUserId = currentUser._id.toString();
    const isAdmin = group.admins.some(a => a.toString() === currentUserId);
    const isSelf  = memberId === currentUserId;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // Can't remove another admin unless you are admin removing non-admin
    if (!isSelf) {
      const targetIsAdmin = group.admins.some(a => a.toString() === memberId);
      if (targetIsAdmin) {
        return res.status(403).json({ message: "Cannot remove another admin" });
      }
    }

    group.members = group.members.filter(m => m.toString() !== memberId);
    group.admins  = group.admins.filter(a => a.toString() !== memberId);
    await group.save();

    return res.status(200).json({ message: isSelf ? "Left group successfully" : "Member removed" });
  } catch (err) {
    console.error("removeMember error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ── Delete group ──────────────────────────────────────────────────────────────
// DELETE /group/:groupId
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const currentUser = req.user;

    const group = await GroupChat.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isAdmin = group.admins.some(a => a.toString() === currentUser._id.toString());
    if (!isAdmin) return res.status(403).json({ message: "Only admins can delete the group" });

    await GroupChat.findByIdAndDelete(groupId);
    return res.status(200).json({ message: "Group deleted successfully" });
  } catch (err) {
    console.error("deleteGroup error:", err);
    return res.status(500).json({ message: err.message });
  }
};

// ── Update group ──────────────────────────────────────────────────────────────
export const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, picture } = req.body;
    const currentUser = req.user;

    const group = await GroupChat.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const isAdmin = group.admins.some(a => a.toString() === currentUser._id.toString());
    if (!isAdmin) return res.status(403).json({ message: "Only admins can update group" });

    if (name)    group.name    = name.trim();
    if (picture) group.picture = picture;
    await group.save();

    return res.status(200).json({ message: "Group updated", data: group });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};