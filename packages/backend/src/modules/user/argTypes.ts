import { ArgsType, Field, ID } from 'type-graphql';

@ArgsType()
export class UserArgs {
  @Field(type => ID)
  id: string;
}

@ArgsType()
export class SignupArgs {
  @Field()
  username: string;

  @Field()
  password: string;
}
