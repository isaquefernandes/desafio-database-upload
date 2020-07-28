import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    if (!['income', 'outcome'].includes(type)) {
      throw new AppError('Transaction type invalid');
    }

    const customRepository = getCustomRepository(TransactionsRepository);

    const { total } = await customRepository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError(
        'You do not have enouth balance fot this transaction!',
      );
    }

    const transactionsRepository = getRepository(Transaction);
    const categoriesReporitory = getRepository(Category);

    let transactionCategory = await categoriesReporitory.findOne({
      where: { title: category },
    });

    if (!transactionCategory) {
      transactionCategory = categoriesReporitory.create({ title: category });
    }

    await categoriesReporitory.save(transactionCategory);

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category: transactionCategory,
    });
    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
