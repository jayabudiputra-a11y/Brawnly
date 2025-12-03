import Input from '../ui/Input';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch }: { onSearch: (term: string) => void }) => {
  return (
    <div className="relative mb-6">
      <Input 
        placeholder="Search inspiration..." 
        className="pl-10" 
        onChange={(e) => onSearch(e.target.value)} 
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
    </div>
  );
};

export default SearchBar;