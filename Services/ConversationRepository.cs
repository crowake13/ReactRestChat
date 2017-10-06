using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using ReactRestChat.Data;
using ReactRestChat.Models;
using ReactRestChat.Models.QueryModels;

namespace ReactRestChat.Services
{
    public class ConversationRepository : Repository<Conversation>, IConversationRepository
    {
        private readonly DbSet<Conversation> _entity;

        public ConversationRepository(ApplicationDbContext context)
            : base(context)
        {
            _entity = context.Set<Conversation>();
        }
        
        private ConversationQueryModel GetBlankConversation(List<string> participantIds)
        {
            IEnumerable<ConversationParticipantQueryModel> participants = _dbContext.Users
                .Where(u => participantIds.Contains(u.Id))
                .Select(u => new ConversationParticipantQueryModel()
                {
                    User = new ApplicationUserQueryModel()
                    {
                        Id = u.Id,
                        Username = u.UserName
                    }
                });

            return new ConversationQueryModel()
            {
                Participants = participants
            };
        }

        public IEnumerable<ConversationQueryModel> GetByPage(string userId, int skip = 0, int? pageSize = null)
        {
            List<Guid> conversationIds = _dbContext.ConversationInstances
                .Include(ci => ci.Participant)
                .Where(ci => ci.ParticipantId == userId && ci.Deleted == null)
                .Select(ci => ci.ConversationId).ToList();

            var conversations = _dbContext.Conversations
                .Include(c => c.Instances)
                    .ThenInclude(ci => ci.Participant)
                .Where(c => conversationIds.Contains(c.Id))
                .OrderBy(c => c.LastMessageCreated)
                .Skip(skip);

            if (pageSize.HasValue && pageSize.Value >= 0) conversations = conversations.Take(pageSize.Value);

            return conversations
                .Select(c => new ConversationQueryModel {
                    Id = c.Id,
                    Title = c.Title,
                    Participants = c.Instances
                        .Where(ci => ci.ParticipantId != userId)
                        .Select(ci => new ConversationParticipantQueryModel() 
                        {
                            User = new ApplicationUserQueryModel {
                                Id = ci.Participant.Id,
                                Username = ci.Participant.UserName
                            },
                            DeletedAfterMessageId = ci.DeletedAfterMessageId,
                            LastReadMessageId = ci.LastReadMessageId
                        })
                });
        }

        public ConversationQueryModel GetById(string userId, Guid id)
        {
            return _entity
                .Include(c => c.Instances)
                    .ThenInclude(ci => ci.Participant)
                .Where(c => c.Id == id)
                .Select(c => new ConversationQueryModel() 
                {
                    Id = c.Id,
                    Title = c.Title,
                    Participants = c.Instances
                        .Where(ci => ci.ParticipantId != userId)
                        .Select(ci => new ConversationParticipantQueryModel() 
                        {
                            User = new ApplicationUserQueryModel() 
                            {
                                Id = ci.Participant.Id,
                                Username = ci.Participant.UserName
                            },
                            LastReadMessageId = ci.LastReadMessageId,
                            DeletedAfterMessageId = ci.DeletedAfterMessageId
                        })
                })
                .FirstOrDefault();
        }

        public ConversationQueryModel ParticipantIds(string userId, IEnumerable<string> participantIds)
        {
            List<string> newParticipantIds = new List<string>();

            newParticipantIds.Add(userId);

            foreach(string participantId in participantIds)
            {
                newParticipantIds.Add(participantId);
            }

            List<Guid> conversationIds = _dbContext.ConversationInstances
                .Where(ci => ci.ParticipantId == userId && ci.Deleted == null)
                .Select(ci => ci.ConversationId).ToList();

            int conversationIdsCount = conversationIds.Count();

            if (conversationIdsCount == 0) return GetBlankConversation(participantIds.ToList());

            IEnumerable<Conversation> conversations = _dbContext.Conversations
                .Include(c => c.Instances)
                .Where(c => conversationIds.Contains(c.Id))
                .OrderBy(c => c.LastMessageCreated);

            List<Guid> invalidConversationIds = new List<Guid>();

            int newParticipantIdsCount = newParticipantIds.Count();

            foreach(Conversation conversation in conversations) {
                var testableParticipantIds = conversation.Instances.Select(ci => ci.ParticipantId);

                if (testableParticipantIds.Count() != newParticipantIdsCount) invalidConversationIds.Add(conversation.Id);
                else foreach(string participantId in newParticipantIds)
                {
                    if (!testableParticipantIds.Contains(participantId)) invalidConversationIds.Add(conversation.Id);
                }
            }

            if (conversationIdsCount == invalidConversationIds.Count()) return GetBlankConversation(participantIds.ToList());

            return conversations
                .Where(c => !invalidConversationIds.Contains(c.Id))
                .Select(c => new ConversationQueryModel()
                {
                    Id = c.Id,
                    Title = c.Title,
                    Participants = c.Instances
                        .Where(ci => ci.ParticipantId != userId)
                        .Select(ci => new ConversationParticipantQueryModel()
                        {
                            User = new ApplicationUserQueryModel()
                            {
                                Id = ci.Participant.Id,
                                Username = ci.Participant.UserName
                            },
                            DeletedAfterMessageId = ci.DeletedAfterMessageId,
                            LastReadMessageId = ci.LastReadMessageId
                        })
                })
                .FirstOrDefault();
        }
        
        public Guid CreateConversation(IEnumerable<string> participantIds, string title)
        {
            if (participantIds == null || participantIds.Count() == 0) throw new Exception("Unable to create a conversation without any participants. ");

            Conversation newConversation = new Conversation()
            {
                Title = title
            };

            _dbContext.Conversations.Add(newConversation);
            _dbContext.SaveChanges();

            return newConversation.Id;
        }

    }
}