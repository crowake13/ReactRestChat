using System.Collections.Generic;

namespace ReactRestChat.Models.QueryModels
{
    public class ConversationListQueryModel
    {
        public IEnumerable<ConversationQueryModel> Conversations { get; set; }

        public bool HasMore { get; set; }
    }
}