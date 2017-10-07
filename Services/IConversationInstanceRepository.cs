using System;
using System.Collections.Generic;
using ReactRestChat.Data;
using ReactRestChat.Models;

namespace ReactRestChat.Services
{
    public interface IConversationInstanceRepository : IRepository<ConversationInstance>
    {
        IEnumerable<Guid> GetConversationIds(string userId);
        void CreateConversationInstance(Guid conversationId, Guid messageId, string participantId);
        void CreateConversationInstances(Guid conversationId, Guid messageId, IEnumerable<string> participantIds);
        bool Exists(Guid conversationId, string userId);
        bool Delete(Guid conversationId, string participantId, Guid lastMessageId);
    }
}