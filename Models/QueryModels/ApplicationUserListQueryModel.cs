using System.Collections.Generic;

namespace ReactRestChat.Models.QueryModels
{
    public class ApplicationUserListQueryModel
    {
        public IEnumerable<ApplicationUserQueryModel> Messages { get; set; }

        public bool HasMore { get; set; }
    }
}