using System;

namespace ReactRestChat.Models.CommandModels
{
    public class ConversationMessageCommandModel
    {
        public Guid? Id { get; set; }
        public ConversationCommandModel Conversation { get; set; }
        public string Content { get; set; }
    }
}
