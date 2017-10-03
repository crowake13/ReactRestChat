using System;

namespace SimpleRestChat.Models.CommandModels
{
    public class ConversationInstanceCommandModel
    {
        public Guid ConversationId { get; set; }
        public bool IsMessageReadVisible { get; set; }
        public Guid? LastReadMessageId { get; set; }
    }
}
