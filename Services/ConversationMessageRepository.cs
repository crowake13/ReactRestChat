using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using ReactRestChat.Data;
using ReactRestChat.Models;
using ReactRestChat.Models.QueryModels;

namespace ReactRestChat.Services
{
    public class ConversationMessageRepository : Repository<ConversationMessage>, IConversationMessageRepository
    {
        private readonly DbSet<ConversationMessage> _entity;
        public ConversationMessageRepository(ApplicationDbContext context)
            : base(context)
        {
            _entity = context.Set<ConversationMessage>();
        }

        private IEnumerable<ConversationMessageQueryModel> ToQueryModel(IEnumerable<ConversationMessage> messages)
        {
            return messages
                .Select(cm => new ConversationMessageQueryModel() 
                {
                    Id = cm.Id,
                    Created = cm.Created,
                    Content = cm.Content,
                    Sender = new ApplicationUserQueryModel() 
                    {
                        Id = cm.Sender.Id,
                        Username = cm.Sender.UserName
                    }
                });
        }

        public IEnumerable<ConversationMessageQueryModel> GetNewerThen(
            Guid conversationId, 
            DateTime newerThenDate)
        {
            var messages = _entity
                .Include(cm => cm.Sender)
                .Where(cm => cm.ConversationId == conversationId && cm.Created > newerThenDate)
                .OrderByDescending(cm => cm.Created);

            return ToQueryModel(messages);
        }

        public IEnumerable<ConversationMessageQueryModel> GetByPage(
            string senderId, 
            Guid conversationId, 
            int skip = 0, 
            int? pageSize = null)
        {
            var messages = _entity
                .Include(cm => cm.Sender)
                .Include(cm => cm.Conversation)
                    .ThenInclude(c => c.Instances)
                .Where(cm => cm.ConversationId == conversationId 
                    && (cm.Deleted == null || cm.SenderId != senderId)
                    && cm.Conversation.Instances
                        .Where(ci => ci.Deleted != null && ci.ParticipantId == senderId)
                        .Select(ci => ci.Deleted)
                        .All(date => cm.Created > date))
                .OrderByDescending(cm => cm.Created)
                .Skip(skip);

            if (pageSize.HasValue && pageSize.Value >= 0) messages = messages.Take(pageSize.Value);

            return ToQueryModel(messages);
        }
        
        public ConversationMessageQueryModel GetLatest(Guid conversationId)
        {
            var messages = _entity
                .Include(cm => cm.Sender)
                .Include(cm => cm.Conversation)
                    .ThenInclude(c => c.Instances)
                .Where(cm => cm.ConversationId == conversationId 
                    && cm.Conversation.Instances
                        .Where(ci => ci.Deleted != null)
                        .Select(ci => ci.Deleted)
                        .All(date => cm.Created > date))
                .OrderByDescending(cm => cm.Created)
                .Take(1);

            return ToQueryModel(messages).FirstOrDefault();
        }

        public ConversationMessageQueryModel GetById(Guid id)
        {
            var messages = _entity
                .Include(cm => cm.Sender)
                .Where(cm => cm.Id == id);

            return ToQueryModel(messages).FirstOrDefault();
        }

        public bool DeleteById(string senderId, Guid id)
        {
            var message = Read(id);

            if (message == null || message.SenderId != senderId) return false;

            message.Deleted = DateTime.Now;

            Update(message);
            Save();

            return true;
        }

        public ConversationMessageCreateQueryModel CreateMessage(Guid conversationId, string senderId, string content)
        {
            if (conversationId == null) throw new Exception("Unable to create a conversation message without a conversation id. ");
            if (String.IsNullOrEmpty(senderId)) throw new Exception("Unable to create a conversation message without a sender id. ");
            if (String.IsNullOrEmpty(content)) throw new Exception("Unable to create a conversation message without content. ");

            ConversationMessage newConversationMessage = new ConversationMessage()
            {
                ConversationId = conversationId,
                SenderId = senderId, 
                Content = content
            };

            _entity.Add(newConversationMessage);
            _dbContext.SaveChanges();

            return new ConversationMessageCreateQueryModel() 
            {
                ConversationId = conversationId, 
                Id = newConversationMessage.Id,
                Content = newConversationMessage.Content,
                Created = newConversationMessage.Created,
                Sender = new ApplicationUserQueryModel()
                {
                    Id = senderId
                }
            };
        }
    }
}