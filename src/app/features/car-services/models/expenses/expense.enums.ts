export enum ExpenseColumnKey {
  Title = 'title',
  Category = 'category',
  Amount = 'amount',
  Period = 'period',
  Note = 'note',
  Actions = 'actions',
}

export enum ExpenseActionId {
  Edit = 'edit',
  Delete = 'delete',
}

export enum ExpenseCategoryFilter {
  All = '',
  Gasoline = 'gasoline',
  Maintenance = 'maintenance',
  Insurance = 'insurance',
  Bank = 'bank',
  Other = 'other',
}
