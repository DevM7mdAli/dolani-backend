import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { NavigateDto } from './dto/navigate.dto';
import { NavigationService } from './navigation.service';

@ApiTags('Navigation')
@Controller('navigation')
export class NavigationController {
  constructor(private readonly navigationService: NavigationService) {}

  @Post('route')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Calculate shortest path between two locations (A*)' })
  @ApiResponse({ status: 200, description: 'Returns the shortest path with waypoints and total distance' })
  @ApiResponse({ status: 404, description: 'No path found between the two locations' })
  navigate(@Body() dto: NavigateDto) {
    const result = this.navigationService.navigate(
      dto.startLocationId,
      dto.endLocationId,
      dto.emergency ?? false,
      dto.avoidStairs ?? false,
    );

    if (!result) {
      throw new NotFoundException('No path found between the specified locations');
    }

    return result;
  }

  @Get('locations')
  @ApiOperation({ summary: 'List all navigable locations' })
  @ApiResponse({ status: 200, description: 'Returns all locations in the navigation graph' })
  getLocations() {
    return this.navigationService.getAllLocations();
  }

  @Post('reload')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reload navigation graph from DB (admin utility)' })
  @ApiResponse({ status: 200, description: 'Graph reloaded successfully' })
  async reloadGraph() {
    await this.navigationService.reloadGraph();
    return { message: 'Navigation graph reloaded successfully' };
  }
}
