using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactRestChat.Data;
using ReactRestChat.Models;
using ReactRestChat.Models.CommandModels;
using ReactRestChat.Models.QueryModels;
using ReactRestChat.Services;

namespace ReactRestChat.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    public class MessageController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConversationRepository _conversationRepository;
        private readonly IConversationMessageRepository _conversationMessageRepository;
        private readonly IConversationInstanceRepository _conversationInstanceRepository;
        
        public MessageController(
            UserManager<ApplicationUser> userManager,
            IConversationRepository conversationRepository,
            IConversationMessageRepository conversationMessageRepository,
            IConversationInstanceRepository conversationInstanceRepository)
        {
            _userManager = userManager;
            _conversationRepository = conversationRepository;
            _conversationMessageRepository = conversationMessageRepository;
            _conversationInstanceRepository = conversationInstanceRepository;
        }

        [HttpGet("{id}")]
        public ConversationMessageQueryModel GetById(Guid id)
        {
            return _conversationMessageRepository.GetById(id);
        }

        [HttpDelete("{id}")]
        public bool Delete(Guid id)
        {
            string userId = _userManager.GetUserId(User);

            return _conversationMessageRepository.DeleteById(userId, id);
        }

        [HttpPost]
        public ConversationMessageCreateQueryModel Create([FromBody] ConversationMessageCommandModel message)
        {
            if (message.Conversation == null) throw new Exception("Unable to create message without a conversation command model. ");
            
            string userId = _userManager.GetUserId(User);

            if (userId == null) throw new Exception("Unauthorized");

            Guid conversationId = message.Conversation.Id;

            if (conversationId == Guid.Empty) {
                conversationId = _conversationRepository.ParticipantIds(userId, message.Conversation.ParticipantIds).Id;
            }

            if (conversationId == Guid.Empty) {
                conversationId = _conversationRepository.CreateConversation(message.Conversation.ParticipantIds, message.Conversation.Title);

                if (conversationId == null) throw new Exception("Something went wrong while creating a new conversation. ");
            }
            
            ConversationMessageCreateQueryModel conversationMessageCreate = _conversationMessageRepository.CreateMessage(conversationId, userId, message.Content);

            conversationMessageCreate.Sender.Username = _userManager.GetUserName(User);

            if (conversationMessageCreate.Id == null) throw new Exception("Something went wrong while creating a new conversation message. ");

            _conversationInstanceRepository.CreateConversationInstance(conversationId, conversationMessageCreate.Id, userId);
            _conversationInstanceRepository.CreateConversationInstances(conversationId, conversationMessageCreate.Id, message.Conversation.ParticipantIds);

            return conversationMessageCreate;
        }
    }
}
