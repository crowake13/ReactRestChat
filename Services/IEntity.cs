using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace ReactRestChat.Services
{
    public interface IEntity
    {
        Guid Id { get; set; }
    }
}