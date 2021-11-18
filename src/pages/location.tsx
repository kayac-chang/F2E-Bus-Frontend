import { Link, useNavigate } from "react-router-dom";
import { Marker } from "react-leaflet";

import { Map, List, Icon, Item } from "@/components";
import { API, SearchParams } from "@/logic";
import { Station } from "@/models";
import { URLSearchParams } from "@/utils";

export function Location() {
  const navigate = useNavigate();
  const query = SearchParams.useQuery();
  const center = SearchParams.useGeo();

  const { data } = API.useGetRecommendQueryQuery(
    {
      query: query!,
      use_geocode_api: true,
      with_bounding_center: true,
    },
    { skip: !query }
  );

  const nearby = data?.stations.some(({ name }) => name === query);

  const toLocation = (station: Station) =>
    nearby
      ? {
          pathname: `/stations/${String(station.id)}`,
        }
      : {
          search: URLSearchParams({
            query: station.name,
            lat: station.position.lat,
            lon: station.position.lon,
          }),
        };

  return (
    <div className="flex-1 flex flex-col text-dark-green">
      <Map
        className="w-full h-[50vh] px-2 my-2"
        center={center}
        bbox={data?.bbox}
      >
        {data?.stations.map((station) => (
          <Marker
            key={String(station.id)}
            icon={Icon.Leaflet.Location}
            position={[station.position.lat, station.position.lon]}
            eventHandlers={{
              click: () => navigate(toLocation(station)),
            }}
          />
        ))}
      </Map>

      <List
        classes={{
          wrapper: "px-8 py-2 text-lg space-y-4",
          list: "max-h-56 overflow-auto pr-2 dark-green-scroll",
        }}
        title={
          <strong className="text-2xl text-dark-green">
            {nearby ? "這附近的站牌" : "我可能想查"}
          </strong>
        }
        items={data?.stations}
      >
        {(item) => (
          <Link to={toLocation(item)}>
            <Item icon={<Icon.Search />}>
              <div className="flex flex-col">
                <strong className="text-lg">{item.name}</strong>

                {nearby || (
                  <small className="text-sm text-gray-400">
                    {item.address}
                  </small>
                )}
              </div>
            </Item>
          </Link>
        )}
      </List>
    </div>
  );
}
