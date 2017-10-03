using System.Collections.Generic;

namespace ReactRestChat.Models.QueryModels
{
    public class ConversationMessageListQueryModel
    {
        public IEnumerable<ConversationMessageQueryModel> Messages { get; set; }

        public bool HasMore { get; set; }
    }
}