using System;

namespace ReactRestChat.Models.QueryModels
{
    public class ConversationMessageQueryModel
    {
        public Guid Id { get; set; }
        
        public DateTime Created { get; set; }

        public ApplicationUserQueryModel Sender { get; set; }

        public string Content { get; set; }
    }
}
