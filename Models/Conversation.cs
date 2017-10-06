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
    // Add profile data for application users by adding properties to the ApplicationUser class
    public class Conversation : IEntity
    {
        public Conversation() 
        {
            Created = DateTime.Now;
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        public DateTime Created { get; private set; }

        public string Title { get; set; }

        public DateTime? LastMessageCreated { get; set; }

        [ForeignKey("ConversationId")]
        public virtual IEnumerable<ConversationMessage> Messages { get; set; }

        [ForeignKey("ConversationId")]
        public virtual IEnumerable<ConversationInstance> Instances { get; set; }
    }
}
