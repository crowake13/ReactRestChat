using System;
using System.Collections.Generic;

namespace ReactRestChat.Models.QueryModels
{
    public class ConversationInstanceQueryModel : ConversationQueryModel
    {        
        public DateTime Created { get; set; }
        
        public bool IsMessageReadVisible { get; set; }

        public Guid? ShowFromMessageId { get; set; }

        public Guid? LastReadMessageId { get; set; }

        public IEnumerable<ConversationMessageQueryModel> Messages { get; set; }
    }
}
