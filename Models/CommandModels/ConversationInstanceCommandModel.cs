using System;

namespace ReactRestChat.Models.CommandModels
{
    public class ConversationInstanceCommandModel
    {
        public Guid ConversationId { get; set; }
        public bool IsMessageReadVisible { get; set; }
        public Guid? LastReadMessageId { get; set; }
    }
}
