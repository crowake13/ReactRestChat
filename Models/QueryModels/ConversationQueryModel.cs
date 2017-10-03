using System;
using System.Collections.Generic;

namespace ReactRestChat.Models.QueryModels
{
    public class ConversationQueryModel
    {
        public Guid Id { get; set; }
        
        public string Title { get; set; }

        public IEnumerable<ConversationParticipantQueryModel> Participants { get; set; }
    }
}
