import config from '../../public/config.json';
import { Client, Account} from 'appwrite';

export const client = new Client();

client
    .setEndpoint(config.appwrite.endpoint)
    .setProject(config.appwrite.projectId);

export const account = new Account(client);
export { ID } from 'appwrite';
