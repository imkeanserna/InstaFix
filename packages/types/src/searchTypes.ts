export type SearchSuggestionType = 'popular' | 'post' | 'category' | 'subcategory';

export interface SearchSuggestion {
  text: string;
  type: SearchSuggestionType;
}
