using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ReactRestChat.Models.QueryModels
{
    public class ConversationQueryModel
    {        
        public Guid Id { get; set; }
        public string Title { get; set; }
        public IEnumerable<ConversationParticipantQueryModel> Participants { get; set; } = new List<ConversationParticipantQueryModel>();
    }
}
