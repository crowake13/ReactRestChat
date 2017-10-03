using System;

namespace ReactRestChat.Models.QueryModels
{
    public class ConversationParticipantQueryModel : ApplicationUserQueryModel
    {
        public Guid? LastReadMessageId { get; set; }

        public Guid? DeletedAfterMessageId { get; internal set; }
    }
}
