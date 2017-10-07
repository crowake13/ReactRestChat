using System;
using System.Collections.Generic;
using ReactRestChat.Data;
using ReactRestChat.Models;
using ReactRestChat.Models.QueryModels;

namespace ReactRestChat.Services
{
    public interface IConversationMessageRepository : IRepository<ConversationMessage>
    {
        IEnumerable<ConversationMessageQueryModel> GetNewerThen(string senderId, Guid conversationId, DateTime newerThenDate);
        IEnumerable<ConversationMessageQueryModel> GetByPage(string senderId, Guid conversationId, int skip, int? pageSize);
        ConversationMessageQueryModel GetLatest(Guid conversationId);
        ConversationMessageQueryModel GetById(Guid id);
        bool DeleteById(string senderId, Guid id);
        ConversationMessageCreateQueryModel CreateMessage(Guid conversationId, string senderId, string content);
    }
}