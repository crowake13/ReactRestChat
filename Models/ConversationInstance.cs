using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using ReactRestChat.Data;

namespace ReactRestChat.Models
{
    public class ConversationInstance : IEntity
    {
        public ConversationInstance() 
        {
            Created = DateTime.Now;
            IsMessageReadVisible = true;
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        public Guid ConversationId { get; set; }

        [ForeignKey("ConversationId")]
        public virtual Conversation Conversation { get; set; }

        public string ParticipantId { get; set; }

        [ForeignKey("ParticipantId")]
        public virtual ApplicationUser Participant { get; set; }

        public DateTime Created { get; private set; }

        public DateTime? Deleted { get; set; }

        public bool IsMessageReadVisible { get; set; }

        public Guid? ShowFromMessageId { get; set; }

        [ForeignKey("ShowFromMessageId")]
        public virtual ConversationMessage ShowFromMessage { get; set; }

        public Guid? LastReadMessageId { get; set; }

        [ForeignKey("LastReadMessageId")]
        public virtual ConversationMessage LastReadMessage { get; set; }
        
        public Guid? DeletedAfterMessageId { get; set; }

        [ForeignKey("DeletedAfterMessageId")]
        public virtual ConversationMessage DeletedAfterMessage { get; set; }
    }
}
