using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using ReactRestChat.Data;
using ReactRestChat.Models;
using ReactRestChat.Models.QueryModels;

namespace ReactRestChat.Services
{
    public class ConversationInstanceRepository : Repository<ConversationInstance>, IConversationInstanceRepository
    {
        private readonly DbSet<ConversationInstance> _entity;
        public ConversationInstanceRepository(ApplicationDbContext context)
            : base(context)
        {
            _entity = context.Set<ConversationInstance>();
        }

        public void CreateConversationInstance(Guid conversationId, Guid messageId, string participantId)
        {
            if (conversationId == null) throw new Exception("Unable to create a conversation instance without a conversation id. ");
            if (participantId == null) throw new Exception("Unable to create a conversation instance without a participant id. ");

            if (Exists(conversationId, participantId)) return;

            ConversationInstance newConversationInstance = new ConversationInstance()
            {
                ConversationId = conversationId,
                ParticipantId = participantId,
                ShowFromMessageId = messageId
            };

            _entity.Add(newConversationInstance);
        }

        public IEnumerable<Guid> GetConversationIds(string userId)
        {
            return _entity
                .Include(ci => ci.Participant)
                .Where(ci => ci.ParticipantId == userId && ci.Deleted == null)
                .Select(ci => ci.ConversationId).AsEnumerable();
        }

        public void CreateConversationInstances(Guid conversationId, Guid messageId, IEnumerable<string> participantIds)
        {
            foreach (string participantId in participantIds) 
            {
                CreateConversationInstance(conversationId, messageId, participantId);
            }

            _dbContext.SaveChanges();
        }

        private IEnumerable<ConversationInstance> Find(Guid conversationId, string participantId)
        {
            return _entity
                .Where(ci => ci.ConversationId == conversationId && ci.ParticipantId == participantId && ci.Deleted == null);
        }

        public bool Exists(Guid conversationId, string participantId)
        {
            return Find(conversationId, participantId).FirstOrDefault() != null;
        }

        public bool Delete(Guid conversationId, string participantId, Guid lastMessageId)
        {
            if (participantId == null) throw new Exception("Unable to delete a conversation instance without a participant id. ");

            var conversationInstance = Find(conversationId, participantId).FirstOrDefault();
            
            if (conversationInstance == null) return false;

            conversationInstance.DeletedAfterMessageId = lastMessageId;
            conversationInstance.Deleted = DateTime.Now;

            _entity.Update(conversationInstance);
            _dbContext.SaveChanges();

            return true;
        }
    }
}