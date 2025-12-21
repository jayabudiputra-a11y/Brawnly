import Input from '../ui/Input';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch }: { onSearch: (term: string) => void }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
        <Search className="w-5 h-5 text-gray-400" />
      </div>

      <Input
        placeholder="Search inspiration..."
        className="pl-10 pr-4 block w-full text-sm rounded-lg border border-gray-300 focus:ring-emerald-500 focus:border-emerald-500"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
