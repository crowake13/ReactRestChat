using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ReactRestChat.Data;
using ReactRestChat.Models;
using ReactRestChat.Models.QueryModels;

namespace ReactRestChat.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    public class UserController : Controller
    {
        static int _issueCount = 0;
        private int _pageSize;
        private readonly ApplicationDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        
        public UserController(
            ApplicationDbContext context,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager)
        {
            _pageSize = 1;
            _context = context;
            _userManager = userManager;
            _signInManager = signInManager;
        }
        
        private IEnumerable<ApplicationUserQueryModel> getUsers(int skip = 0, int? pageSize = null, string search = null)
        {
            string userId = _userManager.GetUserId(User);

            IEnumerable<ApplicationUser> users = _context.Users
                .Where(u => u.Id != userId && (search != null ? u.UserName.Contains(search) : true))
                .OrderBy(u => u.UserName)
                .Skip(skip);

            if (pageSize.HasValue && pageSize.Value >= 0) users = users.Take(pageSize.Value);

            return users
                .Select(u => new ApplicationUserQueryModel {
                    Id = u.Id,
                    Username = u.UserName
                });
        }

        [HttpGet("[action]")]
        public ApplicationUserResponse Latest(int skip, string search)
        {
            IEnumerable<ApplicationUserQueryModel> users = getUsers(skip, _pageSize, search);

            int count = users.Count();

            return new ApplicationUserResponse() {
                Users = users,
                HasMore = count > 0 && _pageSize % count == 0
            };
        }

        [HttpGet]
        public ApplicationUserResponse GetAll()
        {
            IEnumerable<ApplicationUserQueryModel> users = getUsers();

            int count = users.Count();

            return new ApplicationUserResponse() {
                Users = users,
                HasMore = false
            };
        }
    }

    public class ApplicationUserResponse
    {
        public IEnumerable<ApplicationUserQueryModel> Users { get; set; }

        public bool HasMore { get; set; }
    }
}
