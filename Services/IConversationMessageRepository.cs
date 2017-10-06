using System;
using System.Collections.Generic;
using ReactRestChat.Data;
using ReactRestChat.Models;
using ReactRestChat.Models.QueryModels;

namespace ReactRestChat.Services
{
    public interface IConversationMessageRepository : IRepository<ConversationMessage>
    {
        IEnumerable<ConversationMessageQueryModel> GetByPage(Guid conversationId, int skip, int? pageSize);
        ConversationMessageQueryModel GetById(Guid id);
        Guid CreateMessage(Guid conversationId, string senderId, string content);
    }
}