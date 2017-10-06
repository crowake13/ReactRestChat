using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace ReactRestChat.Data
{
    public class Repository<TEntity> : IRepository<TEntity> where TEntity: class, IEntity, new()
    {
        protected readonly ApplicationDbContext _dbContext;

        public Repository(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public void Save()
        {
            _dbContext.SaveChanges();
        }

        public IQueryable<TEntity> GetAll()
        {
            return _dbContext.Set<TEntity>().AsQueryable();
        }

        public void Create(TEntity entitiy)
        {
            _dbContext.Set<TEntity>().Add(entitiy);
            // _dbContext.SaveChanges();
        }

        public TEntity Read(Guid id)
        {
            return _dbContext.Set<TEntity>().FirstOrDefault(x => x.Id == id);
        }

        public void Update(TEntity entitiy)
        {
            _dbContext.Set<TEntity>().Update(entitiy);
            // _dbContext.SaveChanges();
        }

        public void Delete(TEntity entitiy)
        {
            _dbContext.Set<TEntity>().Remove(entitiy);
            // _dbContext.SaveChanges();
        }
    }
}