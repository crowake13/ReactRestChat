using System;
using System.Collections.Generic;

namespace ReactRestChat.Models.CommandModels
{
    public class ConversationCommandModel
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public IEnumerable<string> ParticipantIds { get; set; }
    }
}
