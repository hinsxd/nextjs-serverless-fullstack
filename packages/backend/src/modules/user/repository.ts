import { Repository, EntityRepository } from 'typeorm';
import { User } from '../../entities/User';

// custom Repository class
@EntityRepository(User)
export class UserRepository extends Repository<User> {
  public async getUser(userId?: string | null): Promise<User> {
    if (!userId) {
      throw new Error('User not found');
    }
    return this.findOneOrFail({ where: { id: userId } });
  }
}
