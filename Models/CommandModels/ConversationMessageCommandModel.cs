using System;

namespace SimpleRestChat.Models.CommandModels
{
    public class ConversationMessageCommandModel
    {
        public Guid? Id { get; set; }
        public ConversationCommandModel Conversation { get; set; }
        public string Content { get; set; }
    }
}
