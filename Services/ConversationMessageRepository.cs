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
        public ConversationMessageRepository(ApplicationDbContext context)
            : base(context)
        {

        }

        public IEnumerable<ConversationMessageQueryModel> GetByPage(
            Guid conversationId, 
            int skip = 0, 
            int? pageSize = null)
        {
            var messages = _dbContext.ConversationMessages
                .Include(cm => cm.Sender)
                .Where(cm => cm.ConversationId == conversationId)
                .OrderByDescending(cm => cm.Created)
                .Skip(skip);

            if (pageSize.HasValue && pageSize.Value >= 0) messages = messages.Take(pageSize.Value);

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
        
        public ConversationMessageQueryModel GetById(Guid id)
        {
            return _dbContext.ConversationMessages
                .Include(cm => cm.Sender)
                .Where(cm => cm.Id == id)
                .Select(cm => new ConversationMessageQueryModel() 
                {
                    Id = cm.Id,
                    Created = cm.Created,
                    Content = cm.Content,
                    Sender =  new ApplicationUserQueryModel() 
                        {
                            Id = cm.Sender.Id,
                            Username = cm.Sender.UserName
                        }
                })
                .FirstOrDefault();
        }

        public Guid CreateMessage(Guid conversationId, string senderId, string content)
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

            _dbContext.ConversationMessages.Add(newConversationMessage);
            _dbContext.SaveChanges();

            return newConversationMessage.Id;
        }
    }
}