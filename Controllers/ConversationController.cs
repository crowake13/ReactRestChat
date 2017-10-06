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
using ReactRestChat.Models.QueryModels;
using ReactRestChat.Services;

namespace ReactRestChat.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    public class ConversationController : Controller
    {
        private int _pageSize;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConversationRepository _conversationRepository;
        private readonly IConversationMessageRepository _conversationMessageRepository;
        
        public ConversationController(
            UserManager<ApplicationUser> userManager,
            IConversationRepository conversationRepository,
            IConversationMessageRepository conversationMessageRepository)
        {
            _pageSize = 1;
            _userManager = userManager;
            _conversationRepository = conversationRepository;
            _conversationMessageRepository = conversationMessageRepository;
        }
        
        [HttpGet("[action]")]
        public ConversationListQueryModel Latest(int pageNumber = 0)
        {
            string userId = _userManager.GetUserId(User);

            IEnumerable<ConversationQueryModel> conversations = _conversationRepository.GetByPage(
                userId,
                (pageNumber > 0) ? (pageNumber - 1) * _pageSize : 0,
                _pageSize);

            int count = conversations.Count();

            return new ConversationListQueryModel() {
                Conversations = conversations,
                HasMore = count > 0 && _pageSize % count == 0
            };
        }

        [HttpPost("[action]")]
        public ConversationQueryModel ParticipantIds([FromBody] IEnumerable<string> participantIds)
        {
            string userId = _userManager.GetUserId(User);

            return _conversationRepository.ParticipantIds(userId, participantIds);
        }
        
        [HttpGet("{id}")]
        public ConversationQueryModel GetById(Guid id)
        {
            string userId = _userManager.GetUserId(User);

            return _conversationRepository.GetById(userId, id);
        }

        [HttpGet("{conversationId}/[action]")]
        public ConversationMessageListQueryModel Messages(Guid conversationId, int pageNumber = 0)
        {
            IEnumerable<ConversationMessageQueryModel> messages = _conversationMessageRepository.GetByPage(
                conversationId,
                (pageNumber > 0) ? (pageNumber - 1) * _pageSize : 0,
                _pageSize);

            int count = messages.Count();

            return new ConversationMessageListQueryModel() {
                Messages = messages,
                HasMore = count > 0 && _pageSize % count == 0
            };
        }
    }
}
