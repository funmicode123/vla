const Message = require('../repositories/message.repository');
const Conversation = require('../repositories/conversation.repository');
const CreateMessageRequest = require('../dto/request/message/CreateMessageRequest');
const DeleteMessageRequest = require('../dto/request/message/deleteMessageRequest');

class MessageService {
    async createMessage(data) {
      const createMessageDto = new CreateMessageRequest(data);

      await this.#validateConversationExists(createMessageDto.conversationId);

      const message = await Message.create({
        conversationId: createMessageDto.conversationId,
        senderId: createMessageDto.senderId,
        content: createMessageDto.content,
        messageType: createMessageDto.messageType,
        attachments: createMessageDto.attachments
      });

      await Conversation.addMessage(
        createMessageDto.conversationId,
        message.id
      );
      return message;
    }

    async deleteMessage(data) {

      const deleteMessageDto = DeleteMessageRequest(data);

      await this.#validateConversationExists(conversationId);     

      const message = await Message.findById(messageId);
      if (!message) {
        throw new Error('Message not found');
      }

      if (message.conversationId.toString() !== conversationId.toString()) {
        throw new Error('Message does not belong to the given conversation');
      }

      await Message.delete(deleteMessageDto.messageId);
      await Conversation.removeMessageFromConversation(deleteMessageDto.conversationId);

      return {success: true, message: "Message deleted Successfully"};
    }

    async #validateConversationExists(conversationId){
      const foundConversation = await Conversation.findById(conversationId);
      if (!foundConversation) {
        throw new Error('Conversation not found');
      }
    }
}
module.exports = new MessageService();
