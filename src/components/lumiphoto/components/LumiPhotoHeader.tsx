import { Camera, Box } from 'lucide-react';
import { Link } from 'react-router-dom';

export function LumiPhotoHeader({ delivery }: any) {

  return (
    <div>
      <div className="bg-white shadow-sm py-4 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Camera className="w-8 h-8 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">Lumi Photo</h1>
        </div>
        {
          delivery && (
            <div className="flex items-center space-x-4 sm:space-x-6">
              <Link to="/lumiphoto/delivery"
                className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 transition-colors">
                <Box className="h-5 w-5 mr-2" />
                Painel de Entrega
              </Link>
            </div>
          )
        }
      </div>
    </div>
  );
}
