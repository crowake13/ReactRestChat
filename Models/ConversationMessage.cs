using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using ReactRestChat.Services;

namespace ReactRestChat.Models
{
    public class ConversationMessage : IEntity
    {
        public ConversationMessage() 
        {
            Created = DateTime.Now;
        }

        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public Guid Id { get; set; }

        [Required]
        public Guid ConversationId { get; set; }

        [ForeignKey("ConversationId")]
        public virtual Conversation Conversation { get; set; }

        [Required]
        public string SenderId { get; set; }

        [ForeignKey("SenderId")]
        public virtual ApplicationUser Sender { get; set; }

        public DateTime Created { get; private set; }

        public DateTime? Deleted { get; set; }

        [Required]
        public string Content { get; set; }
    }
}