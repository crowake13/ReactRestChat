using System;

namespace ReactRestChat.Models.QueryModels
{
    public class ConversationMessageCreateQueryModel : ConversationMessageQueryModel
    {
        public Guid ConversationId { get; set; }
    }
}
