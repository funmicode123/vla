const MessageService = require('../services/meesage.serviceImpl');

class MessageController {
  async createMessage(req, res) {
    try {
      const message = await MessageService.createMessage(req.body);
      res.status(201).json({ 
        success: true, 
        message: 'Message created', 
        data: message 
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  }

  async deleteMessage(req, res) {
    try {
      const response = await MessageService.deleteMessage(req.body);
      res.status(200).json({ 
        success: true, 
        message: response.message 
      });
    } catch (error) {
      res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }
  }
}
module.exports = new MessageController();