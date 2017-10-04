using System;
using System.Collections.Generic;

namespace ReactRestChat.Models.QueryModels
{
    public class ConversationInstanceQueryModel
    {
        public ConversationQueryModel Conversation { get; set; } = new ConversationQueryModel();
        public DateTime Created { get; set; } = DateTime.Now;
        public bool IsMessageReadVisible { get; set; } = false;
        public Guid? ShowFromMessageId { get; set; }
        public Guid? LastReadMessageId { get; set; }
        public IEnumerable<ConversationMessageQueryModel> Messages { get; set; } = new List<ConversationMessageQueryModel>();
    }
}
