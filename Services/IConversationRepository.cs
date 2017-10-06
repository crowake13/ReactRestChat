using System;
using System.Collections.Generic;
using ReactRestChat.Data;
using ReactRestChat.Models;
using ReactRestChat.Models.QueryModels;

namespace ReactRestChat.Services
{
    public interface IConversationRepository : IRepository<Conversation>
    {
        IEnumerable<ConversationQueryModel> GetByPage(string userId, int skip, int? pageSize);
        ConversationQueryModel GetById(string userId, Guid id);
        ConversationQueryModel ParticipantIds(string userId, IEnumerable<string> participantIds);
        Guid CreateConversation(IEnumerable<string> participantIds, string title);
    }
}