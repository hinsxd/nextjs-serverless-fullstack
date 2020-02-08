import * as bcrypt from 'bcryptjs';
import * as cookie from 'cookie';
import * as jwt from 'jsonwebtoken';

import { User } from '../../entities/User';
import { Args, Query, Resolver, Mutation, Ctx } from 'type-graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { UserArgs, SignupArgs } from './argTypes';
import { MyContext } from '../../types/context';
// Custom repository with additional logic
// import { UserRepository } from './repository';

@Resolver(User)
export class UserResolver {
  @InjectRepository(User)
  private readonly userRepo: Repository<User>;

  // OR
  // Custom repository with additional logic
  // private readonly userRepo: UserRepository;

  @Query(() => User)
  async user(@Args() { id }: UserArgs): Promise<User> {
    return this.userRepo.findOneOrFail(id);
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { userId }: MyContext): Promise<User | null> {
    if (!userId) return null;
    const user = await this.userRepo.findOneOrFail(userId);
    return user;
  }

  @Query(() => [User])
  async users(): Promise<User[]> {
    return this.userRepo.find();
  }

  @Mutation(() => User)
  async signup(@Args() { username, password }: SignupArgs): Promise<User> {
    const hashed = await bcrypt.hash(password, 5);
    return this.userRepo.save({ username, password: hashed });
  }

  @Mutation(() => User, { nullable: true })
  async login(
    @Args() { username, password }: SignupArgs,
    @Ctx() { setAuth }: MyContext,
    @Ctx() context: any
  ): Promise<User | null> {
    console.log(context.headers);
    try {
      const user = await this.userRepo.findOneOrFail({
        username
      });
      const success = await bcrypt.compare(password, user.password);
      if (!success) {
        console.log('wrong pwd');
        return null;
      }
      delete user.password;
      const accessToken = jwt.sign(
        { ...user, tokenName: 'accessToken', lastLogin: new Date() },
        process.env.ACCESS_TOKEN_SECRET!,
        {
          expiresIn: '1h'
        }
      );

      const refreshToken = jwt.sign(
        { ...user, tokenName: 'refreshToken', lastLogin: new Date() },
        process.env.REFRESH_TOKEN_SECRET!,
        {
          expiresIn: '7d'
        }
      );

      // See src/apolloPlugin.ts
      setAuth.accessToken = accessToken;
      setAuth.refreshToken = refreshToken;
      return user;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
