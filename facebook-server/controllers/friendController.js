const Friend = require('../models/friend');

const friendController = {
  async addFriend(req, res) {
    const { friendId } = req.body;
    const userId = req.user.id;
    await Friend.create(userId, friendId);
    res.json({ success: true });
  },
  async checkFriend(req, res) {
    const { friendId } = req.params;
    const userId = req.user.id;
    const isFriend = await Friend.check(userId, friendId);
    res.json({ isFriend });
  }
};

module.exports = friendController;