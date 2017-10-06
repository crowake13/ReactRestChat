using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace ReactRestChat.Data
{
    public interface IEntity
    {
        Guid Id { get; set; }
    }
}