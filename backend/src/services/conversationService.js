const CreateConversationDTO = require('../dto/request/conversation/createConversation.dto');
const ConversationRepository =  require('../repositories/conversation.repository');
const SessionRepository = require('../repositories/session.repository');

class ConversationService {

  async createConversation(data) {
    const dto = new CreateConversationDTO(data);

    if (!dto.participants.includes(dto.hostId)) {
      dto.participants.push(dto.hostId);
    }

    const conversation = await ConversationRepository.create({
      sessionId: dto.sessionId,
      host: dto.hostId,
      participants: dto.participants
    });

    return conversation;

  }

  async deleteConversation(sessionId){
      const foundSession = await SessionRepository.findById(sessionId);
      if (!foundSession) {
        throw new Error(`Session with ID ${sessionId} not found`);
      }

      const deletedConversation = await ConversationRepository.deleteBySessionId(sessionId);
      if(!deletedConversation){
        throw new Error(`Conversation with ID ${sessionId} not found`);
      }
      return{
        message: 'Conversation deleted successfully',
        deletedConversation
      }
  }
}

module.exports = new ConversationService();
