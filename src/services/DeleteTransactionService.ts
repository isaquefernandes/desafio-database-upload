import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

interface Request {
  transaction_id: string;
}

class DeleteTransactionService {
  public async execute({ transaction_id }: Request): Promise<void> {
    const transactionRepository = getRepository(Transaction);

    const transaction = await transactionRepository.findOne(transaction_id);

    if (!transaction) throw new AppError('Transactions not found!', 404);

    transactionRepository.delete(transaction_id);
  }
}

export default DeleteTransactionService;
