import type { ActiveFilters } from "@/components/tours/tour-filters";

export function TourSort({ filters }: { filters: ActiveFilters }) {
  return (
    <form action="/tours" method="get" className="flex items-center gap-3">
      {filters.category ? <input type="hidden" name="category" value={filters.category} /> : null}
      {filters.duration ? <input type="hidden" name="duration" value={filters.duration} /> : null}
      {filters.price ? <input type="hidden" name="price" value={filters.price} /> : null}
      {filters.destination && filters.destination !== "all" ? <input type="hidden" name="destination" value={filters.destination} /> : null}
      {filters.date ? <input type="hidden" name="date" value={filters.date} /> : null}
      {filters.pax ? <input type="hidden" name="pax" value={filters.pax} /> : null}
      <label htmlFor="tour-sort" className="text-sm font-semibold text-weathered">Sort</label>
      <select id="tour-sort" name="sort" defaultValue={filters.sort ?? "featured"} className="min-h-11 rounded-field border border-charcoal/35 bg-frangipani px-3 text-sm font-semibold text-charcoal outline-none focus:border-terrace focus:ring-3 focus:ring-gold/30">
        <option value="featured">Featured</option>
        <option value="price-low">Price: low to high</option>
        <option value="price-high">Price: high to low</option>
        <option value="duration">Shortest first</option>
      </select>
      <button type="submit" className="min-h-11 rounded-control border border-charcoal/35 px-3 text-sm font-semibold text-charcoal hover:bg-charcoal hover:text-frangipani focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-focus">Update</button>
    </form>
  );
}
