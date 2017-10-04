using System;

namespace ReactRestChat.Models.QueryModels
{
    public class ConversationParticipantQueryModel
    {
        public ApplicationUserQueryModel User { get; set; }
        public Guid? LastReadMessageId { get; set; }

        public Guid? DeletedAfterMessageId { get; internal set; }
    }
}
