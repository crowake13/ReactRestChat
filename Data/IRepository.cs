using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;

namespace ReactRestChat.Data
{
    public interface IRepository<TEntity> where TEntity: class, IEntity, new()
    {
        void Save();
        void Create(TEntity item);
        TEntity Read(Guid id);
        void Delete(TEntity item);
        void Update(TEntity item);
        IQueryable<TEntity> GetAll();
    }
}